package br.com.gabrielfelix.ivoneide_pintura_api.order;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gabrielfelix.ivoneide_pintura_api.order.dto.OrderCreateRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.order.dto.OrderItemRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.order.dto.OrderResponse;
import br.com.gabrielfelix.ivoneide_pintura_api.order.dto.OrderStatusUpdateRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.product.Product;
import br.com.gabrielfelix.ivoneide_pintura_api.product.ProductService;
import br.com.gabrielfelix.ivoneide_pintura_api.user.User;
import br.com.gabrielfelix.ivoneide_pintura_api.user.UserRole;
import br.com.gabrielfelix.ivoneide_pintura_api.user.UserService;

@Service
public class OrderService {

	private final OrderRepository orderRepository;
	private final UserService userService;
	private final ProductService productService;

	public OrderService(OrderRepository orderRepository, UserService userService, ProductService productService) {
		this.orderRepository = orderRepository;
		this.userService = userService;
		this.productService = productService;
	}

	@Transactional
	public OrderResponse create(String userEmail, OrderCreateRequest request) {
		User usuario = userService.findByEmail(userEmail);
		Order order = new Order(usuario, OrderStatus.CRIADO, BigDecimal.ZERO);
		BigDecimal valorTotal = BigDecimal.ZERO;

		for (OrderItemRequest itemRequest : request.getItens()) {
			Product product = productService.findById(itemRequest.getProdutoId());

			if (!Boolean.TRUE.equals(product.getAtivo())) {
				throw new OrderBusinessException("O produto " + product.getNome() + " nao esta disponivel para compra.");
			}

			BigDecimal precoUnitario = product.getPreco();
			BigDecimal subtotal = precoUnitario.multiply(BigDecimal.valueOf(itemRequest.getQuantidade()));
			OrderItem item = new OrderItem(product, itemRequest.getQuantidade(), precoUnitario, subtotal);

			order.addItem(item);
			valorTotal = valorTotal.add(subtotal);
		}

		order.setValorTotal(valorTotal);
		return new OrderResponse(orderRepository.save(order));
	}

	@Transactional(readOnly = true)
	public List<OrderResponse> findMyOrders(String userEmail) {
		User usuario = userService.findByEmail(userEmail);

		return orderRepository.findByUsuarioOrderByCriadoEmDesc(usuario)
				.stream()
				.map(OrderResponse::new)
				.toList();
	}

	@Transactional(readOnly = true)
	public OrderResponse findById(Long id, String userEmail) {
		User usuario = userService.findByEmail(userEmail);
		Order order = usuario.getRole() == UserRole.ADMIN
				? findOrderById(id)
				: orderRepository.findByIdAndUsuario(id, usuario)
						.orElseThrow(() -> new OrderNotFoundException(id));

		return new OrderResponse(order);
	}

	@Transactional(readOnly = true)
	public List<OrderResponse> findAll() {
		return orderRepository.findAll()
				.stream()
				.map(OrderResponse::new)
				.toList();
	}

	@Transactional
	public OrderResponse updateStatus(Long id, OrderStatusUpdateRequest request) {
		Order order = findOrderById(id);
		order.setStatus(request.getStatus());

		return new OrderResponse(orderRepository.save(order));
	}

	private Order findOrderById(Long id) {
		return orderRepository.findById(id)
				.orElseThrow(() -> new OrderNotFoundException(id));
	}
}
